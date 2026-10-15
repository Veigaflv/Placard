import { Component, OnInit, OnDestroy, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { io, Socket } from 'socket.io-client';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FormsModule, CommonModule],
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App implements OnInit, OnDestroy {
  private socket!: Socket;

  connectionStatus: string = "Conectando..."

  @ViewChild('gameOverModal') gameOverModalRef!: ElementRef<HTMLDialogElement>;

  // Variáveis de Estado do Placar
  homeName: string = 'Equipa Casa';
  awayName: string = 'Equipa Fora';
  gameMinutes: number = 12;

  winnerMessage: string = '';

  isSettingsEnabled: boolean = true;

  homePoints: number = 0;
  awayPoints: number = 0;
  homeFouls: number = 0;
  awayFouls: number = 0;

  // Temporizador
  initialSeconds: number = this.gameMinutes * 60;
  totalSeconds: number = this.initialSeconds;
  timerInterval: any = null;
  isRunning: boolean = false;
  startBtnText: string = 'Iniciar';

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.initSocketConnection();
  }

  ngOnDestroy() {
    this.stopTimer();
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  private initSocketConnection() {
    this.socket = io('http://localhost:3000', {
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      console.log('Conectado ao servidor do Placar com sucesso!');
      this.connectionStatus = "Ligado"
      this.cdr.detectChanges();
    });

    this.socket.on('disconnect', (reason: string) => {
      console.log('Conexão perdida:', reason);
      this.connectionStatus = "Conexão perdida"
      this.cdr.detectChanges();
    });

    this.socket.on('updatePlacar', (dto: any) => {
      console.log('Ação a efetuar no placar:', dto.action);
      if (dto.action === 'DECREMENT_HOME_TEAM_FOULS') this.decrementHomeTeamFouls();
      else if (dto.action === 'INCREMENT_HOME_TEAM_FOULS') this.incrementHomeTeamFouls();
      else if (dto.action === 'DECREMENT_HOME_TEAM_POINTS') this.decrementHomeTeamPoints();
      else if (dto.action === 'INCREMENT_HOME_TEAM_POINTS') this.incrementHomeTeamPoints();
      else if (dto.action === 'DECREMENT_AWAY_TEAM_FOULS') this.decrementAwayTeamFouls();
      else if (dto.action === 'INCREMENT_AWAY_TEAM_FOULS') this.incrementAwayTeamFouls();
      else if (dto.action === 'DECREMENT_AWAY_TEAM_POINTS') this.decrementAwayTeamPoints();
      else if (dto.action === 'INCREMENT_AWAY_TEAM_POINTS') this.incrementAwayTeamPoints();
      else if (dto.action === 'TOGGLE_TIMER') this.toggleTimer();
      else if (dto.action === 'RESET_TIMER') this.resetTimer();
      else if (dto.action === 'UPDATE_GAME_INFO') {
        // extrair os dados
        const { homeTeam, awayTeam, gameTime } = dto.data;
        this.updateGameInfo(homeTeam, awayTeam, gameTime); 
      }
      
      this.cdr.detectChanges();
    });
  }

  // --- FORMATAÇÃO DO TEMPO ---
  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  toggleTimer() {
    if (this.isRunning) {
      this.stopTimer();
    } else {
      this.startTimer();
    }
  }

  startTimer() {
    if (this.isRunning && this.timerInterval) {
      this.stopTimer();
      return;
    }

    this.isSettingsEnabled = false;
    this.isRunning = true;
    this.startBtnText = 'Pausar';

    this.timerInterval = setInterval(() => {
      if (this.totalSeconds > 0) {
        this.totalSeconds--;
      } else {
        this.stopTimer();

        if (this.homePoints > this.awayPoints) {
          this.winnerMessage = `Parabéns à equipa ${this.homeName}!`;
        } else if (this.awayPoints > this.homePoints) {
          this.winnerMessage = `Parabéns à equipa ${this.awayName}!`;
        } else {
          this.winnerMessage = `O jogo terminou em Empate!`;
        }

        this.isSettingsEnabled = true;

        if (this.gameOverModalRef) {
          this.gameOverModalRef.nativeElement.showModal();
        }
      }
      this.cdr.detectChanges();
    }, 1000);
  }

  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null; // Garante que a referência é limpa a 100%
    }
    this.timerInterval = null;
    this.isRunning = false;
    this.startBtnText = 'Iniciar';
  }

  resetTimer() {
    this.stopTimer();
    this.totalSeconds = this.initialSeconds;
    this.isSettingsEnabled = true;
    this.cdr.detectChanges();
  }

  // --- MODAL DE DEFINIÇÕES ---
  openSettingsModal(dialogElement: HTMLDialogElement) {
    dialogElement.showModal();
  }

  closeSettingsModal(dialogElement: HTMLDialogElement) {
    dialogElement.close();
  }

  closeGameOverModal(dialogElement: HTMLDialogElement) {
    this.totalSeconds = this.initialSeconds;
    this.homeName = "Equipa Casa"
    this.awayName = "Equipa Fora"
    this.homePoints = this.awayPoints = this.homeFouls = this.awayFouls = 0;
    dialogElement.close();
  }

  saveSettings(dialogElement: HTMLDialogElement, newHomeName: string, newAwayName: string, newMinutes: string) {
    this.homeName = newHomeName || "Equipa Casa";
    this.awayName = newAwayName || "Equipa Fora";
    this.gameMinutes = Number(newMinutes) || 12;

    this.initialSeconds = this.gameMinutes * 60;
    this.resetTimer();
    dialogElement.close();
  }

  updateGameInfo(newHomeName: string, newAwayName: string, newMinutes: string) {
    this.homeName = newHomeName || "Equipa Casa";
    this.awayName = newAwayName || "Equipa Fora";
    this.gameMinutes = Number(newMinutes) || 12;

    this.initialSeconds = this.gameMinutes * 60;
    this.resetTimer();
  }

  // --- MÉTODOS DE PONTOS E FALTAS ---
  decrementHomeTeamFouls() { if (this.homeFouls > 0) this.homeFouls--; }
  incrementHomeTeamFouls() { if (this.homeFouls < 100) this.homeFouls++; }
  decrementHomeTeamPoints() { if (this.homePoints > 0) this.homePoints--; }
  incrementHomeTeamPoints() { if (this.homePoints < 100) this.homePoints++; }

  decrementAwayTeamFouls() { if (this.awayFouls > 0) this.awayFouls--; }
  incrementAwayTeamFouls() { if (this.awayFouls < 100) this.awayFouls++; }
  decrementAwayTeamPoints() { if (this.awayPoints > 0) this.awayPoints--; }
  incrementAwayTeamPoints() { if (this.awayPoints < 100) this.awayPoints++; }
}