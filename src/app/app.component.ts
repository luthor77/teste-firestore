import { Component } from '@angular/core';
import { SubscribeService } from './subscribe.service';
import { Observable } from 'rxjs/Observable';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.css']
})
export class AppComponent {
	merge: any;

	constructor(private subscribeService: SubscribeService) {}

	ngOnInit() {
		this.merge = this.subscribeService.retornaArrayObservable();
	}
}

export class LightswitchComponent {
	isOn = false;
	clicked() {
		this.isOn = !this.isOn;
	}
	get message() {
		return `The light is ${this.isOn ? 'On' : 'Off'}`;
	}
}