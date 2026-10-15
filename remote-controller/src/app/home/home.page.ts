import { Component, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent, 
  IonCard, 
  IonCardHeader, 
  IonCardSubtitle, 
  IonCardTitle, 
  IonCardContent, 
  IonButton,
  IonButtons,
  IonIcon,
  IonModal,
  IonItem,
  IonInput
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { settingsOutline } from 'ionicons/icons';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [
    FormsModule,
    IonHeader, 
    IonToolbar, 
    IonTitle, 
    IonContent, 
    IonCard, 
    IonCardHeader, 
    IonCardSubtitle, 
    IonCardTitle, 
    IonCardContent, 
    IonButton,
    IonButtons,
    IonIcon,
    IonModal,
    IonItem,
    IonInput
  ],
})
export class HomePage implements OnDestroy {
  serverIp: string = ""
  
  // Nomes e Variáveis de Jogo
  homeName: string = 'Equipa Casa';
  awayName: string = 'Equipa Fora';
  gameMinutes: number = 12;

  homePoints: number = 0;
  awayPoints: number = 0;
  homeFouls: number = 0;
  awayFouls: number = 0;

  // Controlo do Modal
  isModalOpen: boolean = false;
  tempHomeName: string = this.homeName;
  tempAwayName: string = this.awayName;
  tempGameMinutes: number = this.gameMinutes;

  // Controlo do Timer
  initialSeconds: number = this.gameMinutes * 60;
  totalSeconds: number = this.initialSeconds;
  timerInterval: any = null;
  isRunning: boolean = false;
  startBtnText: string = 'Iniciar';
  isSettingsEnabled: boolean = true;

  constructor(
    private cdr: ChangeDetectorRef, private http: HttpClient
  ) {
    addIcons({ settingsOutline });
  }

  ngOnInit() {
    // Descobre automaticamente o hostname/IP atual a partir do qual a página foi aberta no browser
    this.serverIp = window.location.hostname;
    console.log('IP do servidor detetado:', this.serverIp);
  }

  setOpen(isOpen: boolean) {
    if (isOpen) {
      // Sincroniza os inputs temporários com os valores atuais antes de abrir
      this.tempHomeName = this.homeName;
      this.tempAwayName = this.awayName;
      this.tempGameMinutes = this.gameMinutes;
    }
    this.isModalOpen = isOpen;
  }

  saveSettings() {
    // cria o objeto com os dados a enviar para o servidor
    const payload = {
      homeTeam: this.tempHomeName,
      awayTeam: this.tempAwayName,
      gameTime: this.tempGameMinutes
    };
    this.http.post(`http://${this.serverIp}:3000/UPDATE_GAME_INFO`, payload).subscribe({
      next: () => {
        // Só atualiza os dados localmente se o servidor responder com sucesso
        this.homeName = this.tempHomeName;
        this.awayName = this.tempAwayName;
        this.gameMinutes = Number(this.tempGameMinutes) || 10;
        this.initialSeconds = this.gameMinutes * 60;
        this.resetTimer();
        this.setOpen(false); // fecha a janela
        this.cdr.detectChanges();
      },
      error: (err) => {
        alert(err)
        console.error('Erro ao comunicar com o servidor:', err);
      }
    });
  }

  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  toggleTimer() {
    this.http.post(`http://${this.serverIp}:3000/TOGGLE_TIMER`, {}).subscribe({
      next: () => {
        this.isRunning ? this.stopTimer() : this.startTimer();
        this.cdr.detectChanges();
      },
      error: (err) => {
        alert(err);
        console.error('Erro ao comunicar com o servidor:', err);
      }
    });
  }

  startTimer() {
    if (this.isRunning) return;

    this.isRunning = true;
    this.startBtnText = 'Pausar';
    this.isSettingsEnabled = false;

    this.timerInterval = setInterval(() => {
      if (this.totalSeconds > 0) {
        this.totalSeconds--;
        this.cdr.detectChanges();
      } else {
        this.stopTimer();
        alert('Fim do tempo!');
        this.totalSeconds = this.initialSeconds; 
        this.homeName = 'Equipa Casa';
        this.awayName = 'Equipa Fora';
        this.tempHomeName = this.homeName;
        this.tempAwayName = this.awayName;
        this.awayFouls = this.awayPoints = this.homeFouls = this.homePoints = 0;
        this.cdr.detectChanges();
      }
    }, 1000);
  }

  stopTimer() {
    clearInterval(this.timerInterval);
    this.timerInterval = null;
    this.isRunning = false;
    this.startBtnText = 'Iniciar';
  }

  resetTimer() {
    this.http.post(`http://${this.serverIp}:3000/RESET_TIMER`, {}).subscribe({
      next: () => {
        // Só reseta o timer se o servidor responder com sucesso
        this.stopTimer();
        this.totalSeconds = this.initialSeconds;
        this.isSettingsEnabled = true;
        this.cdr.detectChanges();
      },
      error: (err) => {
        alert(err)
        console.error('Erro ao comunicar com o servidor:', err);
      }
    });
  }

  incrementPoints(team: 'home' | 'away') {
    if (team === 'home') {
      this.http.post(`http://${this.serverIp}:3000/INCREMENT_HOME_TEAM_POINTS`, {}).subscribe({
        next: () => {
          // SÓ incrementa e atualiza o ecrã se o servidor responder com sucesso
          if(this.homePoints < 100)
            this.homePoints++;
          this.cdr.detectChanges();
        },
        error: (err) => {
          alert(err)
          console.error('Erro ao comunicar com o servidor:', err);
        }
      });
    } 
    else {
      this.http.post(`http://${this.serverIp}:3000/INCREMENT_AWAY_TEAM_POINTS`, {}).subscribe({
        next: () => {
          // SÓ incrementa e atualiza o ecrã se o servidor responder com sucesso
          if(this.awayPoints < 100)
            this.awayPoints++;
          this.cdr.detectChanges();
        },
        error: (err) => {
          alert(err)
          console.error('Erro ao comunicar com o servidor:', err);
        }
      });
    } 
  }

  decrementPoints(team: 'home' | 'away') {
    if (team === 'home') {
      this.http.post(`http://${this.serverIp}:3000/DECREMENT_HOME_TEAM_POINTS`, {}).subscribe({
        next: () => {
          // SÓ incrementa e atualiza o ecrã se o servidor responder com sucesso
          if(this.homePoints > 0)
            this.homePoints--;
          this.cdr.detectChanges();
        },
        error: (err) => {
          alert(err)
          console.error('Erro ao comunicar com o servidor:', err);
        }
      });
    } 
    else {
      this.http.post(`http://${this.serverIp}:3000/DECREMENT_AWAY_TEAM_POINTS`, {}).subscribe({
        next: () => {
          // SÓ incrementa e atualiza o ecrã se o servidor responder com sucesso
          if(this.awayPoints > 0)
            this.awayPoints--;
          this.cdr.detectChanges();
        },
        error: (err) => {
          alert(err)
          console.error('Erro ao comunicar com o servidor:', err);
        }
      });
    } 
  }

  incrementFouls(team: 'home' | 'away') {
    if (team === 'home') {
      this.http.post(`http://${this.serverIp}:3000/INCREMENT_HOME_TEAM_FOULS`, {}).subscribe({
        next: () => {
          // SÓ incrementa e atualiza o ecrã se o servidor responder com sucesso
          if(this.homeFouls < 100)
            this.homeFouls++;
          this.cdr.detectChanges();
        },
        error: (err) => {
          alert(err)
          console.error('Erro ao comunicar com o servidor:', err);
        }
      });
    } 
    else {
      this.http.post(`http://${this.serverIp}:3000/INCREMENT_AWAY_TEAM_FOULS`, {}).subscribe({
        next: () => {
          // SÓ incrementa e atualiza o ecrã se o servidor responder com sucesso
          if(this.awayFouls < 100)
            this.awayFouls++;
          this.cdr.detectChanges();
        },
        error: (err) => {
          alert(err)
          console.error('Erro ao comunicar com o servidor:', err);
        }
      });
    } 
  }

  decrementFouls(team: 'home' | 'away') {
    if (team === 'home') {
      this.http.post(`http://${this.serverIp}:3000/DECREMENT_HOME_TEAM_FOULS`, {}).subscribe({
        next: () => {
          // SÓ incrementa e atualiza o ecrã se o servidor responder com sucesso
          if(this.homeFouls > 0)
            this.homeFouls--;
          this.cdr.detectChanges();
        },
        error: (err) => {
          alert(err)
          console.error('Erro ao comunicar com o servidor:', err);
        }
      });
    } 
    else {
      this.http.post(`http://${this.serverIp}:3000/DECREMENT_AWAY_TEAM_FOULS`, {}).subscribe({
        next: () => {
          // SÓ incrementa e atualiza o ecrã se o servidor responder com sucesso
          if(this.awayFouls > 0)
            this.awayFouls--;
          this.cdr.detectChanges();
        },
        error: (err) => {
          alert(err)
          console.error('Erro ao comunicar com o servidor:', err);
        }
      });
    } 
  }

  ngOnDestroy() {
    this.stopTimer();
  }
}