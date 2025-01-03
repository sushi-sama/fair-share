import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { Item } from '../model/item.model';
import { Person } from '../model/person.model';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-item',
  standalone: true,
  imports: [
    MatCardModule,
    MatIconModule,
    MatDividerModule,
    CommonModule,
    FormsModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './item.component.html',
  styleUrl: './item.component.scss',
})
export class ItemComponent {
  @Input()
  item!: Item;
  @Output()
  personAdded = new EventEmitter<void>();
  @Output()
  itemRemoved = new EventEmitter<string>();
  @Output()
  personRemoved = new EventEmitter<string>();
  newPersonName: string = '';
  @ViewChild('personNameInput') personNameInputRef!: ElementRef;

  addPerson(): void {
    if (!this.isValidnewPersonName()) {
      return;
    }
    const person: Person = this.createNewPerson();
    this.item.people.push(person);
    this.recalculateAmounts();
    this.resetFields();
    this.personAdded.emit();
    this.personNameInputRef.nativeElement.focus();
  }

  removePerson(personName: string): void {
    this.item.people = this.item.people.filter(
      (person) => person.name !== personName
    );
    this.recalculateAmounts();
    this.personRemoved.emit(personName);
  }

  private isValidnewPersonName(): boolean {
    if (!this.newPersonName) {
      alert('Please fill in a valid name.');
      return false;
    }
    if (
      this.item.people.map((person) => person.name).includes(this.newPersonName)
    ) {
      alert('You have already entered that name for this item.');
      return false;
    }
    return true;
  }

  private createNewPerson(): Person {
    return {
      name: this.newPersonName,
      amount: 0,
    };
  }

  private recalculateAmounts(): void {
    const amountOwedPerPerson = parseFloat(
      (this.item.amount / this.item.people.length).toFixed(2)
    );
    this.item.people.forEach((person) => {
      person.amount = amountOwedPerPerson;
    });
  }

  private resetFields(): void {
    this.newPersonName = '';
  }

  removeItem(): void {
    this.itemRemoved.emit(this.item.name);
  }
}
