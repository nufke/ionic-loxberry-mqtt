import { Component, OnInit, OnDestroy } from '@angular/core';
import { LoxBerry } from '../../providers/loxberry';
import { Control, Category } from '../../interfaces/datamodel'

@Component({
  selector: 'app-categories',
  templateUrl: 'categories.page.html',
  styleUrls: ['categories.page.scss']
})
export class CategoriesPage implements OnInit, OnDestroy {

  private filtered_categories: string[];
  public categories: Category[] = [];

  constructor(public LoxBerryService: LoxBerry) {
    
    this.LoxBerryService.getControls().subscribe((controls: Control[]) => {

      this.filtered_categories = controls
        .map(item => item.category )
        .filter((value, index, self) => self.indexOf(value) === index) // remove duplicates
    });

    this.LoxBerryService.getCategories().subscribe((categories: Category[]) => {
      this.categories = categories
        .sort((a, b) => { return a.order - b.order || a.name.localeCompare(b.name); }) // sort A-Z
        .filter( item => this.filtered_categories.indexOf(item.name) > -1);
    });
  }

  public ngOnInit() : void {
  }

  public ngOnDestroy() : void {
    this.LoxBerryService.unload();
  }

}
