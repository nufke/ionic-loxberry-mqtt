import { Component, OnInit, OnDestroy } from '@angular/core';
import { LoxBerry } from '../../providers/loxberry';
import { Control } from '../../interfaces/control'

@Component({
  selector: 'app-rooms',
  templateUrl: 'rooms.page.html',
  styleUrls: ['rooms.page.scss']
})
export class RoomsPage implements OnInit, OnDestroy {

  public controls: Control[];

  public rooms: string[];

  constructor(public LoxBerryService: LoxBerry) {
    this.controls = [];

    this.LoxBerryService.getControls().subscribe((controls: Control[]) => {
      this.controls = controls;

      this.rooms = controls.map(item => item.room)
        .filter((value, index, self) => self.indexOf(value) === index)
        .sort((a, b) => { return a.localeCompare(b); });
    });
  }

  public ngOnInit() : void {
  }

  public ngOnDestroy() : void {
    this.LoxBerryService.unload();
  }

  public filterControls(room: any) : Control[] {
    //console.log('rooms filterControls!', this.controls, this.rooms, room);
    var filteredControls =  this.controls.filter( (resp) => { return resp.room == room });
    return filteredControls.sort( (a, b) => { return a.priority - b.priority });
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
