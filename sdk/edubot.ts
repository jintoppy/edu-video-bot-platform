import { nanoid } from 'nanoid'
import { createApiClient } from './lib/api';
import type { 
  EduBotConfig, 
  ChatOptions, 
  EduBotEvent, 
  ChatSettings,
  ChatMessage 
} from './lib/types';

interface WidgetOptions {
  greeting?: string;
  autoOpen?: boolean;
  delay?: number;
  avatar?: string;
  title?: string;
  subtitle?: string;
  position?: 'bottom-right' | 'bottom-left';
  theme?: {
    primaryColor?: string;
    fontFamily?: string;
  };
}

export class EduBot {
  private api;
  private container: HTMLElement | null = null;
  private iframe: HTMLIFrameElement | null = null;
  private initialized = false;
  private sessionId: string | null = null;
  private widgetMode = false;
  private options: ChatOptions = {};
  private config: EduBotConfig;
  private widgetOptions: WidgetOptions | null = null;
  private eventListeners: { [key: string]: Function[] } = {};

  constructor(config: EduBotConfig) {
    this.config = {
      baseUrl: 'http://localhost:3000',
      ...config
    };
    this.api = createApiClient(config.apiKey, config.baseUrl);
    this.initializeEventListeners();
  }

  private initializeEventListeners() {
    window.addEventListener('message', this.handleIframeMessage.bind(this));
    window.addEventListener('beforeunload', this.handleBeforeUnload.bind(this));
  }

  private handleIframeMessage(event: MessageEvent) {
    // Only handle messages from our iframe
    if (this.iframe && event.source === this.iframe.contentWindow) {
      const message = event.data as EduBotEvent;
      
      switch (message.type) {
        case 'CHAT_INITIALIZED':
          this.sessionId = message.payload.data?.sessionId ?? nanoid();
          this.emit('chatInitialized', message.payload);
          break;
        case 'MESSAGE_SENT':
          this.emit('messageSent', message.payload);
          break;
        case 'MESSAGE_RECEIVED':
          this.emit('messageReceived', message.payload);
          break;
        case 'SESSION_ENDED':
          this.sessionId = null;
          this.emit('sessionEnded', message.payload);
          break;
        case 'ERROR':
          console.error('EduBot Error:', message.payload.message);
          this.emit('error', message.payload);
          break;
      }
    }
  }

  private handleBeforeUnload() {
    if (this.sessionId) {
      // Attempt to save session state
      this.api.saveSessionState(this.sessionId).catch(console.error);
    }
  }

  private init() {
    if (this.initialized) return;

    // Create container
    this.container = document.createElement('div');
    this.container.id = 'edubot-container';
    document.body.appendChild(this.container);

    // Load styles
    const style = document.createElement('link');
    style.rel = 'stylesheet';
    style.href = `${this.config.baseUrl}/sdk/styles/embedded.css`;
    document.head.appendChild(style);

    this.initialized = true;
  }

  // Widget mode initialization
  initWidget(options: WidgetOptions = {}) {
    const defaults: WidgetOptions = {
      greeting: "👋 Hi there! How can we help you today?",
      autoOpen: false,
      delay: 1000,
      title: "Student Counseling",
      subtitle: "Typically replies within an hour",
      position: 'bottom-right'
    };

    this.widgetOptions = { ...defaults, ...options };
    this.widgetMode = true;

    // Initialize if not already done
    if (!this.initialized) {
      this.init();
    }

    // Add widget class and position
    if (this.container) {
      this.container.classList.add('edubot-widget-mode');
      this.container.classList.add(`edubot-widget-${this.widgetOptions.position}`);

      // Apply custom theme if provided
      if (this.widgetOptions.theme) {
        this.container.style.setProperty('--edubot-primary', this.widgetOptions.theme?.primaryColor ?? '#3B82F6');
        this.container.style.setProperty('--edubot-font-family', this.widgetOptions.theme?.fontFamily ?? "Inter");
      }
    }

    this.createWidgetButton();
    this.createGreetingBubble();

    // Auto-open if configured
    if (this.widgetOptions.autoOpen) {
      setTimeout(() => {
        this.startChat();
      }, this.widgetOptions.delay);
    }
  }

  private createWidgetButton() {
    const widgetButton = document.createElement('button');
    widgetButton.className = 'edubot-widget-button';
    widgetButton.innerHTML = `
      <div class="edubot-widget-button-closed">
        <div class="edubot-widget-icon">💬</div>
      </div>
      <div class="edubot-widget-button-opened">
        <div class="edubot-widget-close">×</div>
      </div>
    `;

    widgetButton.addEventListener('click', () => {
      if (!this.sessionId) {
        this.startChat();
      } else {
        this.toggleChat();
      }
    });

    this.container?.appendChild(widgetButton);
  }

  private createGreetingBubble() {
    if (!this.widgetOptions?.greeting) return;

    const greetingBubble = document.createElement('div');
    greetingBubble.className = 'edubot-widget-greeting';
    greetingBubble.innerHTML = `
      <div class="edubot-widget-greeting-text">${this.widgetOptions.greeting}</div>
      <div class="edubot-widget-greeting-close">×</div>
    `;

    this.container?.appendChild(greetingBubble);

    // Show greeting after delay
    setTimeout(() => {
      greetingBubble.classList.add('edubot-widget-greeting-visible');
    }, this.widgetOptions.delay);

    // Handle greeting interactions
    const closeBtn = greetingBubble.querySelector('.edubot-widget-greeting-close');
    closeBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      greetingBubble.remove();
    });

    greetingBubble.addEventListener('click', () => {
      greetingBubble.remove();
      this.startChat();
    });
  }

  private toggleChat() {
    if (this.iframe) {
      const isVisible = this.iframe.style.display !== 'none';
      this.iframe.style.display = isVisible ? 'none' : 'block';
      const button = this.container?.querySelector('.edubot-widget-button');
      button?.classList.toggle('edubot-widget-button-active', !isVisible);
    }
  }

  // Start chat session
  async startChat(options: ChatOptions = {}) {
    this.options = { ...this.options, ...options };

    if (!this.initialized) {
      this.init();
    }

    try {
      // Initialize chat session
      const response = await this.api.initializeChat(this.options);
      
      if (response.error) {
        throw new Error(response.error.message);
      }

      this.sessionId = response.data?.sessionId;

      // Create and setup iframe
      if (this.container) {
        this.iframe = document.createElement('iframe');
        this.iframe.src = `${this.config.baseUrl}/sdk/embedded-chat`;
        this.iframe.className = this.widgetMode ? 'edubot-widget-iframe' : 'edubot-iframe';
        
        // Update widget button if in widget mode
        if (this.widgetMode) {
          const button = this.container.querySelector('.edubot-widget-button');
          button?.classList.add('edubot-widget-button-active');
        }
        
        this.container.appendChild(this.iframe);
        
        // Initialize chat in iframe
        this.iframe.onload = () => {
          this.iframe?.contentWindow?.postMessage({
            type: 'CHAT_INITIALIZED',
            payload: {
              sessionId: this.sessionId,
              settings: this.widgetOptions,
              ...this.options
            }
          }, '*');
        };
      }
    } catch (error) {
      console.error('Failed to start chat:', error);
      this.emit('error', { message: 'Failed to start chat', error });
    }
  }

  // End chat session
  async endChat() {
    if (this.sessionId) {
      try {
        await this.api.endSession(this.sessionId);
        this.sessionId = null;
        
        if (this.iframe) {
          this.iframe.remove();
          this.iframe = null;
        }

        if (this.widgetMode) {
          const button = this.container?.querySelector('.edubot-widget-button');
          button?.classList.remove('edubot-widget-button-active');
        }

        this.emit('sessionEnded', { sessionId: this.sessionId });
      } catch (error) {
        console.error('Failed to end chat:', error);
        this.emit('error', { message: 'Failed to end chat', error });
      }
    }
  }

  // Event handling
  on(event: string, callback: Function) {
    if (!this.eventListeners[event]) {
      this.eventListeners[event] = [];
    }
    this.eventListeners[event].push(callback);
  }

  off(event: string, callback: Function) {
    if (this.eventListeners[event]) {
      this.eventListeners[event] = this.eventListeners[event].filter(
        cb => cb !== callback
      );
    }
  }

  private emit(event: string, data: any) {
    if (this.eventListeners[event]) {
      this.eventListeners[event].forEach(callback => callback(data));
    }
  }

  // Public utility methods
  isActive(): boolean {
    return !!this.sessionId;
  }

  getSessionId(): string | null {
    return this.sessionId;
  }

  destroy() {
    if (this.sessionId) {
      this.endChat();
    }
    
    if (this.container) {
      this.container.remove();
      this.container = null;
    }
    
    window.removeEventListener('message', this.handleIframeMessage);
    window.removeEventListener('beforeunload', this.handleBeforeUnload);
    
    this.initialized = false;
    this.widgetMode = false;
    this.eventListeners = {};
  }
}

// Make EduBot available globally
declare global {
  interface Window {
    EduBot: typeof EduBot;
  }
}

window.EduBot = EduBot;