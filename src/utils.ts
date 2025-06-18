import { Subject, Subscription } from "rxjs";

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

type DisposableMember =
  | Disposable
  | Subscription
  | Subject<unknown>
  | (() => void);

export class DisposableGroup implements Disposable {
  private members: DisposableMember[] = [];

  add(member: DisposableMember) {
    this.members.push(member);
  }

  [Symbol.dispose]() {
    this.members.forEach((member) => {
      if (member instanceof Subscription) {
        member.unsubscribe();
      } else if (member instanceof Subject) {
        member.complete();
      } else if (typeof member === "function") {
        member();
      } else if (Symbol.dispose in member) {
        member[Symbol.dispose]();
      }
    });
  }
}

type AsyncDisposableMember =
  | AsyncDisposable
  | (() => Promise<void>)
  | DisposableMember;

export class AsyncDisposableGroup implements AsyncDisposable {
  private members: AsyncDisposableMember[] = [];

  add(member: AsyncDisposableMember) {
    this.members.push(member);
  }

  async [Symbol.asyncDispose]() {
    for (const member of this.members) {
      if (member instanceof Subscription) {
        member.unsubscribe();
      } else if (member instanceof Subject) {
        member.complete();
      } else if (typeof member === "function") {
        await member();
      } else if (Symbol.dispose in member) {
        member[Symbol.dispose]();
      } else if (Symbol.asyncDispose in member) {
        await member[Symbol.asyncDispose]();
      }
    }
  }
}
