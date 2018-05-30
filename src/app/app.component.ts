import {
  Component
} from '@angular/core';
import {
  Observable
} from 'rxjs/Rx';
import 'rxjs/add/operator/take'
import {
  AngularFirestore,
  AngularFirestoreCollection
} from 'angularfire2/firestore';
import {
  AngularFireAuth
} from 'angularfire2/auth';
import {
  DocumentReference
} from '@firebase/firestore-types';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  teste: any;
  items: any = [];
  testeFire: any;

  constructor(private db: AngularFirestore) {
  }

  ngOnInit() {
    // this.subscribeFunction();

    this.teste = this.db.collection('testeFire').valueChanges().map(teste => {
      let array = [];
      teste.forEach(tes => {
        let atendimento: DocumentReference = tes['atendimento'];
        this.db.doc(atendimento.path).snapshotChanges().subscribe(tipo =>{
          let position = null;

          for (const obj in array) {
            if (array.hasOwnProperty(obj)) {
              if (array[obj]['id'] === tipo.payload.id){
                position = obj;
              }
            }
          }

          if(position){
            this.items[position] = {
              id: tipo.payload.id,
              tipo: tipo.payload.data()['tipo'],
              teste: tes['teste']
            }
          } 
          else {
            array.push({
              id: tipo.payload.id,
              tipo: tipo.payload.data()['tipo'],
              teste: tes['teste']
            })
          }
        })
        array.push(tes['teste'])
      })
      return array
    })
  }

  subscribeFunction() {
    this.db.collection('testeFire').valueChanges().subscribe(docs => {
      this.items = [];
      docs.forEach(element => {
        let atendimento: DocumentReference = element['atendimento'];
        this.db.doc(atendimento.path).snapshotChanges().subscribe(tipo =>{
          let position = null;

          for (const obj in this.items) {
            if (this.items.hasOwnProperty(obj)) {
              if (this.items[obj]['id'] === tipo.payload.id){
                position = obj;
              }
            }
          }

          if(position){
            this.items[position] = {
              id: tipo.payload.id,
              tipo: tipo.payload.data()['tipo'],
              teste: element['teste']
            }
          } 
          else {
            this.items.push({
              id: tipo.payload.id,
              tipo: tipo.payload.data()['tipo'],
              teste: element['teste']
            })
          }
        })
      });
    })
  }
}
