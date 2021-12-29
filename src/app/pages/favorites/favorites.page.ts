import { Component, OnInit, OnDestroy } from '@angular/core';
import { LoxBerry } from '../../providers/loxberry';
import { Control } from '../../interfaces/control'

@Component({
  selector: 'app-favorites',
  templateUrl: 'favorites.page.html',
  styleUrls: ['favorites.page.scss']
})
export class FavoritesPage implements OnInit, OnDestroy {

  public controls: Control[];

  public favorites: Control[];

  constructor(public LoxBerryService: LoxBerry) {
    this.controls = [];

    this.LoxBerryService.getControls().subscribe((controls: Control[]) => {
      this.controls = controls;

      this.favorites = controls.filter(item => item.is_favorite)
        .sort((a, b) => { return a.name.localeCompare(b.name); })
    });
  }

  public ngOnInit() : void {
  }

  public ngOnDestroy() : void {
    this.LoxBerryService.unload();
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
