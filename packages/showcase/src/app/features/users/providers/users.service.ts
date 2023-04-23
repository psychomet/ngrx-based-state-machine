import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { UserInterface } from '../types';
import { map, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  constructor(private httpClient: HttpClient) {}

  getUsers() {
    return this.httpClient
      .get<UserInterface[]>(
        'https://random-data-api.com/api/users/random_user?size=3'
      )
      .pipe(
        tap(() => console.log('fetch users action received')),
        map((users) => {
          console.log('fetch users action successful');
          return users;
        })
      );
  }
}
