import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { InsidePage } from './inside.page';

describe('InsidePage', () => {
  let component: InsidePage;
  let fixture: ComponentFixture<InsidePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InsidePage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(InsidePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
