import { Injectable } from '@angular/core';
import { AngularFirestore } from 'angularfire2/firestore';
import { Observable } from 'rxjs/Rx';

@Injectable()
export class SubscribeService {
	array: any;

	constructor(private db: AngularFirestore) {}

	// cria o observable do tipo de atendimento
	tipoAtendimento(path) {
		return this.db.doc(path).snapshotChanges()
	}

	// preenche o array
	pushArray(testeFire) {
		this.array = [];
		this.tipoAtendimento(testeFire['atendimento'].path).take(1).subscribe(doc => {
			this.array.push({
				id_atendimento: doc.payload.id,
				tipo: doc.payload.data()['tipo'],
				teste: testeFire['teste']
			})
		})
	}

	// verifica a posição do array e o id para alterar o dado somente na posição específica
	verificaArray(tipo) {
		for (const obj in this.array) {
			if (this.array.hasOwnProperty(obj)) {
				if (this.array[obj]['id_atendimento'] === tipo['payload'].id) {
					this.array[obj]['tipo'] = tipo['payload'].data()['tipo'];
					return this.array
				}
			}
		}
	}

	retornaArrayObservable() {
		// swithcMap somente o observable que recebeu mudanças para o próximo operator
		// diferente do map que retorna todos unidos em um
		return this.db.collection('testeFire').valueChanges()
			.switchMap(tfCollection => {
				let merge

				tfCollection.forEach(doc => {
					// cria um observable unindo os observables de cada tipo de atendimento
					merge = Observable.merge(merge || Observable, this.tipoAtendimento(doc['atendimento'].path));

					this.pushArray(doc)
				})

				return merge
			})
			.map(tipoAtendimento => this.verificaArray(tipoAtendimento))
	}
}