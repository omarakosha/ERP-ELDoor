import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
    standalone: true,
    selector: 'app-footer',
    imports: [
        CommonModule,
        TranslateModule   // ✅ هذا هو الحل
    ],
    template: `
<div class="layout-footer flex items-center justify-between px-12 py-3">
    
    <span>
        {{ 'footer.rights' | translate }}
    </span>

    <a href="https://Rqm.com"
       target="_blank"
       rel="noopener noreferrer"
       class="text-primary font-bold hover:underline flex items-center gap-2">
       
       {{ 'footer.poweredBy' | translate }}
        <img src="assets/icons/rqm.png"
             alt="Company Logo"
             style="width: 35.8px; height: 35.8px;"
             class="object-contain"/>
    </a>

</div>
    `
})
export class AppFooter {

    constructor(private translate: TranslateService) { }

}
