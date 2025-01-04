import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ItemContribution } from './model/item-contribution.model';
import { Item } from './model/item.model';
import { MatDividerModule } from '@angular/material/divider';
import { ItemComponent } from './item/item.component';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FlexLayoutModule } from '@angular/flex-layout';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    MatDividerModule,
    ItemComponent,
    FormsModule,
    MatCardModule,
    MatListModule,
    MatInputModule,
    MatButtonModule,
    FlexLayoutModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  items: Item[] = [];
  itemName: string = '';
  itemAmount!: any;
  personToShare: Map<string, number> = new Map();
  personToItemContribution: Map<string, ItemContribution[]> = new Map();
  isBillCopiedToClipboard: boolean = false;
  totalBillAmount: number = 0;
  @ViewChild('itemNameInput') itemNameInputRef!: ElementRef;

  addItem(): void {
    if (!this.isValidItem()) {
      return;
    }
    const newItem = this.createNewItem();
    this.items.push(newItem);
    this.resetFields();
    this.itemNameInputRef.nativeElement.focus();
    this.totalBillAmount += Number(newItem.amount);
  }

  removeItem(itemName: string): void {
    this.totalBillAmount -= this.items
      .filter((item) => item.name === itemName)
      .pop()!.amount;
    this.items = this.items.filter((item) => item.name !== itemName);
    this.updateBill();
  }

  updateBill() {
    this.personToShare.clear();
    this.personToItemContribution.clear();
    this.items.forEach((item) => {
      item.people.forEach((person) => {
        if (this.personToShare.has(person.name)) {
          const currentAmount = this.personToShare.get(person.name)!;
          this.personToShare.set(person.name, currentAmount + person.amount);
          const currentItemContributions = this.personToItemContribution.get(
            person.name
          );
          currentItemContributions!.push({
            itemName: item.name,
            contributionAmount: parseFloat(
              (item.amount / item.people.length).toFixed(2)
            ),
          });
          this.personToItemContribution.set(
            person.name,
            currentItemContributions!
          );
        } else {
          this.personToShare.set(person.name, person.amount);
          this.personToItemContribution.set(person.name, [
            {
              itemName: item.name,
              contributionAmount: parseFloat(
                (item.amount / item.people.length).toFixed(2)
              ),
            },
          ]);
        }
      });
    });
  }

  private isValidItem(): boolean {
    if (!this.itemName || this.itemAmount <= 0 || isNaN(this.itemAmount)) {
      alert('Please fill in all fields correctly.');
      return false;
    }
    return true;
  }

  private createNewItem(): Item {
    return {
      name: this.itemName,
      amount: this.itemAmount,
      people: [],
    };
  }

  private resetFields(): void {
    this.itemName = '';
    this.itemAmount = '';
  }

  copyBill(): void {
    const text = this.generateBill();
    navigator.clipboard
      .writeText(text)
      .then(() => {
        this.isBillCopiedToClipboard = true; // Show the notification
        setTimeout(() => {
          this.isBillCopiedToClipboard = false; // Hide it after 3 seconds
        }, 3000); // 3000ms = 3 seconds
      })
      .catch((err) => {
        console.error('Failed to copy text: ', err);
      });
  }

  private generateBill(): string {
    let bill = `Total Amount: ${this.totalBillAmount}\n-------------------------------------------\n`;

    this.personToItemContribution.forEach((itemContributions, personName) => {
      // Calculate the total amount for the person
      const totalAmount = itemContributions.reduce(
        (sum, item) => sum + item.contributionAmount,
        0
      );

      // Add the person's name and total amount
      bill += `${personName}: ₹${totalAmount.toFixed(2)}\n`;

      // Add each item's contribution
      itemContributions.forEach((contribution) => {
        bill += `\t- ${
          contribution.itemName
        }: ₹${contribution.contributionAmount.toFixed(2)}\n`;
      });

      // Add a separator line
      bill += '-------------------------------------------\n';
    });

    return bill;
  }
}
