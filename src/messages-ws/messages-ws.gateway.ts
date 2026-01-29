import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { MessagesWsService } from './messages-ws.service';
import { Server, Socket } from 'socket.io';
import { NewMessageDto } from './dto/new-message.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from 'src/auth/interfaces';

@WebSocketGateway({ cors: { origin: '*' } })
export class MessagesWsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() wss: Server;

  constructor(
    private readonly messagesWsService: MessagesWsService,
    private readonly jwtService: JwtService,
  ) {}

  async handleConnection(client: Socket) {
    const token = client.handshake.headers.authentication as string;
    let payload: JwtPayload;

    try {
      payload = this.jwtService.verify<JwtPayload>(token);
      await this.messagesWsService.registarClient(client, payload.id);
    } catch {
      client.disconnect();
      return;
    }

    this.wss.emit(
      'clients-updated',
      this.messagesWsService.getConnectedClients(),
    );
  }

  handleDisconnect(client: Socket) {
    // console.log('Client disconnected ' + client.id);
    this.messagesWsService.removeClient(client.id);

    this.wss.emit(
      'clients-updated',
      this.messagesWsService.getConnectedClients(),
    );
  }

  @SubscribeMessage('message-from-client')
  handleMessageFromClient(client: Socket, payload: NewMessageDto) {
    console.log(client.id, payload);
    //? Emite a todos los clientes
    this.wss.emit('message-from-server', {
      fullName: this.messagesWsService.getUserFullName(client.id),
      message: payload.message || 'no-message!!',
    });

    // //? Emite solo al cliente que hizo el request
    // client.emit('message-from-server', {
    //   fullName: this.messagesWsService.getUserFullName(client.id),
    //   message: payload.message || 'no-message!!',
    // });

    // //? Emite a todos menos al que hizo el request
    // client.broadcast.emit('message-from-server', {
    //   fullName: this.messagesWsService.getUserFullName(client.id),
    //   message: payload.message || 'no-message!!',
    // });
  }
}
