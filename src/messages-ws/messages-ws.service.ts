import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Socket } from 'socket.io';
import { User } from 'src/auth/entities/user.entity';
import { Repository } from 'typeorm';

interface ConnectedClients {
  [id: string]: {
    socket: Socket;
    user: User;
  };
}

@Injectable()
export class MessagesWsService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}
  private conectedClients: ConnectedClients = {};

  async registarClient(client: Socket, userId: string) {
    const user = await this.userRepository.findOneBy({ id: userId });

    if (!user) throw new Error('User not found');
    if (!user.isActive) throw new Error('User is not active');
    this.checkUsersConnected(user);
    this.conectedClients[client.id] = {
      socket: client,
      user,
    };
  }

  removeClient(clientId: string) {
    delete this.conectedClients[clientId];
  }

  getConnectedClients(): string[] {
    console.log(this.conectedClients);
    return Object.keys(this.conectedClients);
  }
  getUserFullName(clientId: string) {
    return this.conectedClients[clientId].user.fullName;
  }

  checkUsersConnected(user: User) {
    for (const clientId of Object.keys(this.conectedClients)) {
      const connectedUser = this.conectedClients[clientId];
      if (connectedUser.user.id === user.id) {
        connectedUser.socket.disconnect();
        break;
      }
    }
  }
}
