import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { HttpClientModule } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { Header } from '../header/header';
import { Footer } from '../footer/footer';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, Header, Footer],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login {
  username = '';
  password = '';

  constructor(private auth: AuthService, private router: Router,  private http: HttpClient) {}

  login() {
  console.log('🔐 Sending login with:', this.username, this.password);
this.auth.login(this.username, this.password).subscribe({
  next: (res) => {
    this.auth.setUser(res.user, res.token); // user thật, có id
    this.router.navigate(['/room']);
  },
  error: (err) => alert('Sai tài khoản hoặc mật khẩu!')
});

}
}
