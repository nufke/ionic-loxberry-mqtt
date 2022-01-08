import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LoxBerry } from '../../providers/loxberry';
import { Control, Category, Room } from '../../interfaces/datamodel'

@Component({
  selector: 'app-controls',
  templateUrl: 'controls.page.html',
  styleUrls: ['controls.page.scss']
})
export class ControlsPage implements OnInit, OnDestroy {

  public controls: Control[] = [];
  public categories: Category[] = [];
  public rooms: Room[] = [];
  
  public items: any[];
  
  private filtered_categories: string[];
  private filtered_rooms: string[];

  private domain: string;
  private topic: string;
  private id: string;

  public itemName: string;
  public key: string;
  
  constructor(public LoxBerryService: LoxBerry,
              private route: ActivatedRoute) {

    this.domain = this.route.snapshot.paramMap.get('domain');
    this.id = this.route.snapshot.paramMap.get('id');
    this.topic = this.domain+'/' + this.id;

    if (this.domain === 'category')
      this.key = 'room';

    if (this.domain === 'room')
      this.key = 'category';

    this.LoxBerryService.getControls().subscribe((controls: Control[]) => {
      this.controls = controls;

      this.filtered_categories = controls
        .map(item => item.category )
        .filter((value, index, self) => self.indexOf(value) === index) // remove duplicates

      this.filtered_rooms = controls
        .map(item => item.room )
        .filter((value, index, self) => self.indexOf(value) === index) // remove duplicates

      this.updateControlState(controls);
    });
    
    this.LoxBerryService.getCategories().subscribe((categories: Category[]) => {
      this.categories = categories
      .sort((a, b) => { return a.order - b.order || a.name.localeCompare(b.name); })
      .filter( item => this.filtered_categories.indexOf(item.name) > -1);
      
      if (this.domain === 'category')
        this.itemName = this.findName(categories, this.topic);

      if (this.domain === 'room')
        this.items = categories;
    });

    this.LoxBerryService.getRooms().subscribe((rooms: Room[]) => {
      this.rooms = rooms
      .sort((a, b) => { return a.order - b.order || a.name.localeCompare(b.name); })
      .filter( item => this.filtered_rooms.indexOf(item.name) > -1);

      if (this.domain === 'room')
        this.itemName = this.findName(rooms, this.topic);

      if (this.domain === 'category')
        this.items = rooms;
    });
  }

  public ngOnInit() : void {
  }

  public ngOnDestroy() : void {
  }

  private findName(obj: any, topic:string) {
    for(let i = 0; i < obj.length; i++) {
      if (obj[i].topic === topic) return obj[i].name;
    }
    return; // topic not found
  }

  public filter(item: any, label: any) : Control[] {
    let filtered_items =  item.filter( resp => { return (resp[this.domain] == this.itemName) && 
      (resp[this.key] == label.name ) });
    return filtered_items.sort( (a, b) => { return a.order - b.order || a.name.localeCompare(b.name) });
}

  public is_empty(item: any, label: any) : Boolean {
    return (this.filter(item, label).length > 0);
  }

  private updateControlState(control: any)
  {
    control.forEach( item => {
      if (item.type === 'switch') {
        item.state._toggle = (item.state.value == '1');
        item.state._message = item.state._toggle ? "On" : "Off";
      }
      if (item.type === 'radio') {
        if (item.state.states) {
          let val = parseInt(item.state.value);
          item.state._message = item.state.states[val];
        }
      }
    });
  }

  pushed($event, control) {
    $event.preventDefault();
    $event.stopPropagation();
    console.log('pushed', control);
  }

  pushed_radio($event, control) {
    $event.preventDefault();
    $event.stopPropagation();
    console.log('pushed radio', control);
    
    if (control.state.states) // process only if there are radio states
    {
      let val = parseInt(control.state.value);
      console.log(val);
      if (val == (control.state.states.length-1))
        val = 0;
      else
        val++;
    
      control.state.value = String(val);
      this.LoxBerryService.sendMessage(control);
    }
  }

  pushed_up($event, control) {
    $event.preventDefault();
    $event.stopPropagation();
    console.log('pushed up', control);
    control.state.value = "up";
    this.LoxBerryService.sendMessage(control);
  }
  
  pushed_down($event, control) {
    $event.preventDefault();
    $event.stopPropagation();
    console.log('pushed down', control);
    control.state.value = "down";
    this.LoxBerryService.sendMessage(control);
  }

  pushed_plus($event, control) {
    $event.preventDefault();
    $event.stopPropagation();
    console.log('pushed plus', control);
    control.state.value = "plus";
    this.LoxBerryService.sendMessage(control);
  }

  pushed_minus($event, control) {
    $event.preventDefault();
    $event.stopPropagation();
    console.log('pushed minus', control);

    control.state.value = "minus";
    this.LoxBerryService.sendMessage(control);
  }

  toggle($event, control) {
    $event.preventDefault();
    $event.stopPropagation();

    if (control.state._toggle) {
      control.state._message = "Off";
      control.state.value = "0";
    }
    else {
      control.state._message = "On";
      control.state.value = "1";
    }
    this.LoxBerryService.sendMessage(control);
  }

}
