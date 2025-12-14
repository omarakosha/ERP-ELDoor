import { LoaderService } from '@/apiservice/loading.service';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [
        RouterModule,
        CommonModule   // ← ← الحل
    ],
    template: `
  <div class="main-content-wrapper"> <!-- الحاوية الرئيسية فقط -->

<div class="card-loader-wrapper" *ngIf="loaderService.loading$ | async">
  <div class="card-loader-ring"></div>
  <img src="assets/icons/rqm.png" class="card-loader-img">
</div>



  <!-- باقي محتوى الصفحة -->
  <router-outlet></router-outlet>
</div>

    `
})
export class AppComponent {
  constructor(public loaderService: LoaderService) {}
}
