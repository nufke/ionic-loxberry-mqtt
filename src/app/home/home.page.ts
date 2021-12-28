import { Component, ViewChild } from '@angular/core';
import { LoxBerry } from '../providers/loxberry';
import { Control } from '../interfaces/control'

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  public controls: Control[];

  public rooms: string[];

  constructor(public LoxBerryService: LoxBerry) {
    this.controls = [];

    this.LoxBerryService.load().subscribe((controls: Control[]) => {
      this.controls = controls;

      this.rooms = this.controls.map(item => item.room)
        .filter((value, index, self) => self.indexOf(value) === index)
        .sort((a, b) => { return a.localeCompare(b); })
    });
  }

  public ngOnDestroy() : void {
    this.LoxBerryService.unload();
  }

  public filterControls(room: any) : Control[] {
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
  }
}