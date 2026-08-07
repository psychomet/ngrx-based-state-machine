import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { UserInterface } from '../types';
import { map, tap } from 'rxjs';

interface DummyJsonUser {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
}

interface DummyJsonUsersResponse {
  users: DummyJsonUser[];
}

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private httpClient = inject(HttpClient);

  getUsers() {
    return this.httpClient
      .get<DummyJsonUsersResponse>(
        'https://dummyjson.com/users?limit=3&select=id,firstName,lastName,username,email',
      )
      .pipe(
        tap(() => console.log('fetch users action received')),
        map((response) =>
          response.users.map(
            (user): UserInterface => ({
              id: user.id,
              first_name: user.firstName,
              last_name: user.lastName,
              username: user.username,
              email: user.email,
            }),
          ),
        ),
        tap(() => console.log('fetch users action successful')),
      );
  }
}
