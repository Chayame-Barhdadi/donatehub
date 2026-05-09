import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AiAssistantComponent } from './components/ai-assistant/ai-assistant.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, AiAssistantComponent],
  template: `
    <router-outlet />
    <app-ai-assistant></app-ai-assistant>
  `
})
export class App {}
