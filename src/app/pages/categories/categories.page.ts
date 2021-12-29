import { Component, OnInit, OnDestroy } from '@angular/core';
import { LoxBerry } from '../../providers/loxberry';
import { Control } from '../../interfaces/control'

@Component({
  selector: 'app-categories',
  templateUrl: 'categories.page.html',
  styleUrls: ['categories.page.scss']
})
export class CategoriesPage implements OnInit, OnDestroy {

  public controls: Control[];

  public categories: string[];

  constructor(public LoxBerryService: LoxBerry) {
    this.controls = [];

    this.LoxBerryService.getControls().subscribe((controls: Control[]) => {
      this.controls = controls;
    
      this.categories = controls.map(item => item.category)
        .filter((value, index, self) => self.indexOf(value) === index) // remove duplicates
        .sort((a, b) => { return a.localeCompare(b); }) // sort A-Z
    });
  }

  public ngOnInit() : void {
  }

  public ngOnDestroy() : void {
    this.LoxBerryService.unload();
  }

  public filterControls(category: any) : Control[] {
    //console.log('categories filterControls!', this.controls, this.categories, category);
    var filteredControls =  this.controls.filter( (resp) => { return resp.category == category });
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
