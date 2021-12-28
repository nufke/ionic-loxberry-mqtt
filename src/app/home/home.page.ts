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

  constructor(public LoxBerryService: LoxBerry) {
    this.controls = [];

    this.LoxBerryService.load().subscribe((controls: Control[]) => {
      this.controls = controls;
    });
  }

  public ngOnDestroy() : void {
    this.LoxBerryService.unload();
  }

  public sortControls() : Control[] {
    return this.controls.sort( (a, b) => { return a.priority - b.priority });
  }

}