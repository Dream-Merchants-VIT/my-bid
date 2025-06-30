import { Server as SocketIOServer } from "socket.io"
import { createServer } from "http"
import type { WebSocketMessage } from "../types"

let io: SocketIOServer | undefined

export function getSocketIOServer() {
  if (!io) {
    const httpServer = createServer()
    io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.NEXTAUTH_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
      },
    })

    io.on("connection", (socket) => {
      console.log("Client connected:", socket.id)

      socket.on("join-room", (room: string) => {
        socket.join(room)
        //console.log(Socket ${socket.id} joined room: ${room})
      })

      socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id)
      })
    })
  }
  return io
}

export function broadcastToRoom(room: string, message: WebSocketMessage) {
  const socketServer = getSocketIOServer()
  socketServer.to(room).emit("message", message)
} 