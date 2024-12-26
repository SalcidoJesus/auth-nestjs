import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';
import { MessagesWsService } from './messages-ws.service';
import { NewMessageDto } from './dto/new-message.dto';
import { JwtPayload } from '../auth/interfaces';

@WebSocketGateway({ cors: true })
export class MessagesWsGateway implements OnGatewayConnection, OnGatewayDisconnect {

	@WebSocketServer() wss: Server

	constructor(
		private readonly messagesWsService: MessagesWsService,
		private readonly jwtService: JwtService
	) {}

	async handleConnection(client: Socket, ...args: any[]) {

		const token = client.handshake.headers.authentication as string;
		// console.log({token});
		let payload: JwtPayload;

		try {
			payload = this.jwtService.verify(token);
			await this.messagesWsService.registerClient( client, payload.id );

		} catch (error) {
			client.disconnect();
			return;
		}


		// console.log('Client connected:', client.id);
		// this.messagesWsService.registerClient( client, payload.id )

		this.wss.emit('clients-updated', this.messagesWsService.getConnectedClients() )

	}

	handleDisconnect(client: Socket) {
		// console.log('client disconnected:', client.id);
		this.messagesWsService.removeClient( client.id )
	}

	@SubscribeMessage('message-from-client')
	messageFromClient( client: Socket, payload: NewMessageDto ) {
		// console.log({
		// 	client: client.id, payload
		// });

		//! esto sólo emite a un cliente
		// client.emit('message-from-server', {
		// 	fullName: 'NestJS',
		// 	message: payload.message || 'no-message'
		// });

		// emitir a todos, menos al cliente
		// client.broadcast.emit('message-from-server', {
		// 	fullName: 'NestJS',
		// 	message: payload.message || 'no-message'
		// });

		// emitir a todos
		this.wss.emit('message-from-server', {
			fullName: this.messagesWsService.getUserFullName( client.id ),
			message: payload.message || 'no-message'
		});
	}

}
