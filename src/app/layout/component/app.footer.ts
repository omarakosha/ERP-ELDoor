import { Component } from '@angular/core';

@Component({
    standalone: true,
    selector: 'app-footer',
    template: `
    
    <div class="layout-footer flex items-center gap-2">
    <span>Developed by</span>
    <a href="https://Rqm.com" target="_blank" rel="noopener noreferrer" class="text-primary font-bold hover:underline flex items-center gap-2">
        <img src="assets/icons/rqm.png" alt="Company Logo"  style="width: 35.8px; height: 35.8px;" class="object-contain"/>
        Rqm-Ltd
    </a>
</div>

    `
})
export class AppFooter {}
