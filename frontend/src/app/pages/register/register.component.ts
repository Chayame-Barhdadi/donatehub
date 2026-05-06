import { Component, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

export function passwordStrengthValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  if (!value) return null;
  const hasMinLength = value.length >= 6;
  const hasNumber = /[0-9]/.test(value);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(value);
  const isValid = hasMinLength && (hasNumber || hasSpecial);
  return isValid ? null : { passwordStrength: true };
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  registerForm: FormGroup = this.fb.group({
    name: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, passwordStrengthValidator]],
    city: ['', [Validators.required]]
  });

  errorMessage: string = '';
  loading: boolean = false;
  showCityDropdown: boolean = false;
  cityQuery: string = '';

  get filteredCities() {
    if (!this.cityQuery) return this.moroccanCities;
    return this.moroccanCities.filter(c => c.toLowerCase().includes(this.cityQuery.toLowerCase()));
  }

  moroccanCities: string[] = [
    'Casablanca', 'Rabat', 'Marrakech', 'Fès', 'Tanger', 'Agadir', 'Meknès', 'Oujda', 'Tétouan', 'Essaouira',
    'El Jadida', 'Nador', 'Kénitra', 'Safi', 'Béni Mellal', 'Errachidia', 'Laâyoune', 'Dakhla', 'Taroudant',
    'Ouarzazate', 'Al Hoceïma', 'Ifrane', 'Chefchaouen', 'Khouribga', 'Settat', 'Taza', 'Guelmim', 'Berrechid',
    'Ksar El Kebir', 'Larache', 'Sidi Kacem', 'Sidi Slimane', 'Taourirt', 'Jerada', 'Azrou', 'Midelt',
    'Tinghir', 'Zagora', 'Boujdour', 'Smara'
  ];

  getPasswordStrength(): number {
    const value = this.registerForm.get('password')?.value || '';
    let strength = 0;
    if (value.length >= 6) strength++;
    if (/[0-9]/.test(value)) strength++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(value)) strength++;
    return strength;
  }

  onSubmit() {
    console.log("Form Status:", this.registerForm.status); console.log("Form Errors:", this.registerForm.errors); if (this.registerForm.valid) {
      this.loading = true;
      this.authService.register(this.registerForm.value).subscribe({
        next: () => {
          this.router.navigate(['/login']);
        },
        error: (err) => {
          this.errorMessage = err.error || "Erreur lors de l'inscription";
          this.loading = false;
        }
      });
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.form-group')) {
      this.showCityDropdown = false;
    }
  }
}



