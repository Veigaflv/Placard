import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: [
      'http://localhost',
      'http://localhost:3000',
      'http://localhost:4200', //quando fazemos: ng serve
      'http://127.0.0.1',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:4200', //quando fazemos: ng serve
      'null', // Para quando abre o HTML diretamente via file://
    ],
  },
})
export class SocketService {
  @WebSocketServer()
  server: Server;

  updatePlacar(data: any): boolean {
    try {
      this.server.emit('updatePlacar', data);
      return true;
    } catch (error) {
      console.error('Erro ao emitir socket:', error);
      return false;
    }
  }

  handleConnection() {
    console.log(` --> [Socket] Interface conectado.`);
  }

  handleDisconnect() {
    console.log(` --> [Socket] Interface desconectou-se.`);
  }
}