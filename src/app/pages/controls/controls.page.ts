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

  public filter_item: string;
  public key: string;

  constructor(public LoxBerryService: LoxBerry,
              private route: ActivatedRoute) {

    this.domain = this.route.snapshot.paramMap.get('domain');
    this.id = this.route.snapshot.paramMap.get('id');
    this.topic = this.domain+'/' + this.id;

    this.LoxBerryService.getControls().subscribe((controls: Control[]) => {
      this.controls = controls;

      this.filtered_categories = controls
        .map(item => item.category )
        .filter((value, index, self) => self.indexOf(value) === index) // remove duplicates

      this.filtered_rooms = controls
        .map(item => item.room )
        .filter((value, index, self) => self.indexOf(value) === index) // remove duplicates
    });

    //console.log('filtered_rooms:', this.filtered_rooms);
    //console.log('filtered_categories:', this.filtered_categories);
    
    this.LoxBerryService.getCategories().subscribe((categories: Category[]) => {
      this.categories = categories
      .sort((a, b) => { return a.order - b.order || a.name.localeCompare(b.name); })
      .filter( item => this.filtered_categories.indexOf(item.name) > -1);
    });

    this.LoxBerryService.getRooms().subscribe((rooms: Room[]) => {
      this.rooms = rooms
      .sort((a, b) => { return a.order - b.order || a.name.localeCompare(b.name); })
      .filter( item => this.filtered_rooms.indexOf(item.name) > -1);
    });
    
    if (this.domain === 'category') { 
      this.items = this.rooms;
      this.key = 'room';
      this.filter_item = this.findName(this.categories, this.topic);
    }

    if (this.domain === 'room') {
      this.items = this.categories;
      this.key = 'category';
      this.filter_item = this.findName(this.rooms, this.topic);
    }

    //console.log('categories:', this.categories);
    //console.log('rooms:', this.rooms);
  }

  public ngOnInit() : void {
  }

  public ngOnDestroy() : void {
    this.LoxBerryService.unload();
  }

  private findName(obj: any, topic:string) {
    for(var i = 0; i < obj.length; i++) {
      if (obj[i].topic === topic) return obj[i].name;
    }
    return -1; // topic not found
  }

  public filter(item: any, label: any) : Control[] {
    var filtered_items =  item.filter( resp => { return (resp[this.domain] == this.filter_item) && 
                                                        (resp[this.key] == label.name ) });
    return filtered_items.sort( (a, b) => { return a.order - b.order || a.name.localeCompare(b.name) });
  }

  public is_empty(item: any, label: any) : Boolean {
    return (this.filter(item, label).length > 0);
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
  }

  pushed_up($event, control) {
    $event.preventDefault();
    $event.stopPropagation();
    console.log('pushed up', control);
  }
  
  pushed_down($event, control) {
    $event.preventDefault();
    $event.stopPropagation();
    console.log('pushed down', control);
  }

  pushed_plus($event, control) {
    $event.preventDefault();
    $event.stopPropagation();
    console.log('pushed plus', control);
  }

  pushed_minus($event, control) {
    $event.preventDefault();
    $event.stopPropagation();
    console.log('pushed minus', control);
  }

  toggle($event, control){
    $event.preventDefault();
    $event.stopPropagation();
    console.log('toggle', control);

    if (control.state.value)
      control.state.message="Off";
    else
      control.state.message="On";
  }

}