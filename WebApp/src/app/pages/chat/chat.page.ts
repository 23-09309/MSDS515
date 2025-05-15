import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ChatService } from '../../services/chat.service';
import { AuthService } from '../../services/auth.service';
import { LoadingService } from '../../services/loading.service';
import { AlertController } from '@ionic/angular';
import { marked } from 'marked';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
})
export class ChatPage implements OnInit {
  thread_id = '';
  messages: { text: string; me: boolean; created?: string }[] = [];
  message = '';
  THREAD_STORAGE_KEY = 'sparchat-thread';
  isTyping = false;

  constructor(
    private chat: ChatService,
    private auth: AuthService,
    private router: Router,
    public loadingSvc: LoadingService,
    private alertCtrl: AlertController,
    private sanitizer: DomSanitizer
  ) {}

  parseMarkdown(markdownText: string): SafeHtml {
    const html = marked.parse(markdownText || '', {async: false});
    return this.sanitizer.bypassSecurityTrustHtml(html as string);
  }

  async confirmLogout() {
    const alert = await this.alertCtrl.create({
      header: "Logout Confirmation",
      message: "Are you sure you want to logout? Your current chat thread will not be saved.",
      buttons: [
        {
          text: 'Cancel', role: 'cancel'
        },
        {
          text: 'Logout', role: 'destructive',
          handler: () => this.logout()
        }
      ]
    });
    await alert.present();
  }

  onInputKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  saveThread() {
    localStorage.setItem(this.THREAD_STORAGE_KEY, JSON.stringify(this.messages));
  }
  
  restoreThread() {
    const thread = localStorage.getItem(this.THREAD_STORAGE_KEY);
    if (thread) {
      try {
        this.messages = JSON.parse(thread);
      } catch {
        this.messages = [];
        localStorage.removeItem(this.THREAD_STORAGE_KEY);
      }
    }
  }

  scrollToBottom() {
    setTimeout(() => {
      const messenger = document.querySelector('.messenger-content');
      if (messenger) messenger.scrollTop = messenger.scrollHeight;
    }, 50);
  }

  ngOnInit() {
    const token = this.auth.token$.value;
    if (!token) {
      this.router.navigate(['/login']);
      return;
    }
    //this.restoreThread();
    this.messages = [];
    if (this.messages.length === 0) {
      // Only start a new chat API call if no thread is restored
      this.isTyping = true; // Show typing indicator while waiting
      //this.loadingSvc.show();
      this.chat.startChat(token).subscribe({
        next: (res) => {
          this.isTyping = false;
          //this.loadingSvc.hide();
          this.thread_id = res.thread_id;
          this.messages.push({ text: res.greeting, me: false });
          this.saveThread();
          this.scrollToBottom();
        },
        error: () => {
          this.isTyping = false;
          //this.loadingSvc.hide();
          alert('Failed to start chat, please log in again.');
          this.router.navigate(['/login']);
        }
      });
    } else {
      this.scrollToBottom();
    }
  }

  sendMessage() {
    if (!this.message || !this.thread_id) return;
    const timestamp = new Date().toLocaleString('en-US', { day: '2-digit', month: 'long', year: 'numeric' });
    const messageWithTimestamp = `${this.message} (message created on ${timestamp})`;
    const token = this.auth.token$.value!;
    this.messages.push({
      text: this.message,
      me: true,
      //created: new Date().toLocaleString('en-US', { day: '2-digit', month: 'long', year: 'numeric' })
    });
    this.saveThread();
    this.scrollToBottom();
  
    this.loadingSvc.show();
    this.isTyping = true;
    this.chat.continueChat(token, this.thread_id, messageWithTimestamp).subscribe({
      next: (res) => {
        this.loadingSvc.hide();
        this.isTyping = false;
        this.messages.push({ text: res.response, me: false });
        this.saveThread();
        this.scrollToBottom();
      },
      error: () => {
        this.loadingSvc.hide();
        this.isTyping = false;
        this.messages.push({ text: '(Failed to send, try again)', me: false });
        this.saveThread();
      }
    });
    this.message = '';

    let btn = document.querySelector('.plane-btn');
    if (btn) {
      btn.classList.add('animated');
      setTimeout(() => btn.classList.remove('animated'), 400);
    }
  }

  logout() {
    const refresh = this.auth.refresh$.value;
    const access = this.auth.token$.value;
    this.loadingSvc.show();
    if (!refresh || !access) {
      this.auth.clearSession();
      this.loadingSvc.hide();
      this.router.navigate(['/login']);
      return;
    }
    this.auth.logout(refresh, access).subscribe({
      next: () => {
        this.auth.clearSession();
        this.loadingSvc.hide();
        this.router.navigate(['/login']);
      },
      error: () => {
        this.auth.clearSession();
        this.loadingSvc.hide();
        this.router.navigate(['/login']);
      }
    });
  }
}