import { Controller, Get, Post, Body } from '@nestjs/common';
import { AppService } from './app.service';
import { SocketService } from './socket.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService, private socketService: SocketService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('/DECREMENT_HOME_TEAM_FOULS')
  decrementHomeTeamFaults() {
    const success = this.socketService.updatePlacar( {action: "DECREMENT_HOME_TEAM_FOULS"})
    if (success) {
      return { success: true };
    } else {
      return { success: false, message: "Falha ao sincronizar via socket" };
    }
  }

  @Post('/INCREMENT_HOME_TEAM_FOULS')
  incrementHomeTeamFaults() {
    const success = this.socketService.updatePlacar( {action: "INCREMENT_HOME_TEAM_FOULS"})
    if (success) {
      return { success: true };
    } else {
      return { success: false, message: "Falha ao sincronizar via socket" };
    }
  }

  @Post('/DECREMENT_HOME_TEAM_POINTS')
  decrementHomeTeamPoints() {
    const success = this.socketService.updatePlacar( {action: "DECREMENT_HOME_TEAM_POINTS"})
    if (success) {
      return { success: true };
    } else {
      return { success: false, message: "Falha ao sincronizar via socket" };
    }
  }

  @Post('/INCREMENT_HOME_TEAM_POINTS')
  incrementHomeTeamPoints() {
    const success = this.socketService.updatePlacar( {action: "INCREMENT_HOME_TEAM_POINTS"})
    if (success) {
      return { success: true };
    } else {
      return { success: false, message: "Falha ao sincronizar via socket" };
    }
  }

  @Post('/DECREMENT_AWAY_TEAM_FOULS')
  decrementAwayTeamFaults() {
    const success = this.socketService.updatePlacar( {action: "DECREMENT_AWAY_TEAM_FOULS"})
    if (success) {
      return { success: true };
    } else {
      return { success: false, message: "Falha ao sincronizar via socket" };
    }
  }

  @Post('/INCREMENT_AWAY_TEAM_FOULS')
  incrementAwayTeamFaults() {
    const success = this.socketService.updatePlacar( {action: "INCREMENT_AWAY_TEAM_FOULS"})
    if (success) {
      return { success: true };
    } else {
      return { success: false, message: "Falha ao sincronizar via socket" };
    }
  }

  @Post('/DECREMENT_AWAY_TEAM_POINTS')
  decrementAwayTeamPoints() {
    const success = this.socketService.updatePlacar( {action: "DECREMENT_AWAY_TEAM_POINTS"})
    if (success) {
      return { success: true };
    } else {
      return { success: false, message: "Falha ao sincronizar via socket" };
    }
  }

  @Post('/INCREMENT_AWAY_TEAM_POINTS')
  incrementAwayTeamPoints() {
    const success = this.socketService.updatePlacar( {action: "INCREMENT_AWAY_TEAM_POINTS"})
    if (success) {
      return { success: true };
    } else {
      return { success: false, message: "Falha ao sincronizar via socket" };
    }
  }

  @Post('/TOGGLE_TIMER')
  startTimer() {
    const success = this.socketService.updatePlacar( {action: "TOGGLE_TIMER"})
    if (success) {
      return { success: true };
    } else {
      return { success: false, message: "Falha ao sincronizar via socket" };
    }
  }

  @Post('/RESET_TIMER')
  resetTimer() {
    const success = this.socketService.updatePlacar( {action: "RESET_TIMER"})
    if (success) {
      return { success: true };
    } else {
      return { success: false, message: "Falha ao sincronizar via socket" };
    }
  }

  @Post('/UPDATE_GAME_INFO')
  updateGameInfo(@Body() body: { homeTeam: string; awayTeam: string; gameTime: string }) {
    // Extrai os dados enviados pelo corpo do pedido HTTP
    const { homeTeam, awayTeam, gameTime } = body;

    const success = this.socketService.updatePlacar({
      action: 'UPDATE_GAME_INFO',
      data: { homeTeam, awayTeam, gameTime }
    });

    if (success) {
      return { success: true };
    } else {
      return { success: false, message: "Falha ao sincronizar via socket" };
    }
  }
}
