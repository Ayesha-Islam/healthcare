import { EventEmitter } from "events";

export interface DomainEvent {
  id: string;
  type: string;
  aggregateId: string;
  payload: Record<string, any>;
  timestamp: Date;
}

export interface IDomainEventPublisher {
  publish(event: DomainEvent): Promise<void>;
  subscribe(
    eventType: string,
    handler: (event: DomainEvent) => Promise<void>
  ): void;
  unsubscribe(
    eventType: string,
    handler: (event: DomainEvent) => Promise<void>
  ): void;
}

export class DomainEventPublisher implements IDomainEventPublisher {
  private eventEmitter: EventEmitter;
  private eventStore: DomainEvent[] = [];

  constructor() {
    this.eventEmitter = new EventEmitter();
    this.eventEmitter.setMaxListeners(100); // Increase limit for more subscribers
  }

  async publish(event: DomainEvent): Promise<void> {
    try {
      // Store event for potential replay/audit
      this.eventStore.push(event);

      // Emit event to subscribers
      this.eventEmitter.emit(event.type, event);

      //Also emit a generic event for global listeners
      this.eventEmitter.emit("*", event);

      console.log(
        `📡 Published event: ${event.type} for aggregate ${event.aggregateId}`
      );
    } catch (error) {
      console.error(`❌ Failed to publish event ${event.type}`, error);
    }
  }

  subscribe(
    eventType: string,
    handler: (event: DomainEvent) => Promise<void>
  ): void {
    const wrappedHandler = async (event: DomainEvent) => {
      try {
        await handler(event);
      } catch (error) {
        console.error(`❌ Error in event handler for ${eventType}`, error);
      }
    };

    this.eventEmitter.on(eventType, wrappedHandler);
    console.log(`📩subscribe to event: ${eventType}`);
  }

  unsubscribe(
    eventType: string,
    handler: (event: DomainEvent) => Promise<void>
  ): void {
    this.eventEmitter.off(eventType, handler);
    console.log(`📪 unsubscribed from event: ${eventType}`);
  }

  // Additional utility methods
  getEventHistory(aggregateId?: string): DomainEvent[] {
    if (aggregateId) {
      return this.eventStore.filter(
        (event) => event.aggregateId === aggregateId
      );
    }
    return [...this.eventStore];
  }

  clearEventHistory(): void {
    this.eventStore = [];
  }
}
