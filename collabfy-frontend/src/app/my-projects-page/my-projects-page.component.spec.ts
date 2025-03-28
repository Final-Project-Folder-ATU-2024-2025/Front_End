import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyProjectsPageComponent } from './my-projects-page.component';

describe('MyProjectsPageComponent', () => {
  let component: MyProjectsPageComponent;
  let fixture: ComponentFixture<MyProjectsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyProjectsPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyProjectsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
