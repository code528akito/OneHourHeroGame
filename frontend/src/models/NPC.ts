export type NPCType = 'merchant' | 'guard' | 'villager' | 'sage';

export interface DialogOption {
  text: string;
  action?: () => void;
  nextDialogId?: string;
}

export interface Dialog {
  id: string;
  text: string;
  options?: DialogOption[];
  autoClose?: boolean; // 自動で閉じる（情報提供のみの場合）
  skipable?: boolean; // スキップ可能
}

export interface NPCData {
  id: string;
  name: string;
  type: NPCType;
  x: number;
  y: number;
  sprite?: string; // スプライト画像のパス
  dialogs: Dialog[]; // 会話データ
  initialDialogId: string; // 初期会話ID
  info?: {
    monsterWeakness?: Record<string, string>; // モンスター名 -> 弱点情報
    tips?: string[]; // ヒント情報
  };
}

export class NPC {
  id: string;
  name: string;
  type: NPCType;
  x: number;
  y: number;
  sprite?: string;
  dialogs: Map<string, Dialog>;
  currentDialogId: string;
  info?: {
    monsterWeakness?: Record<string, string>;
    tips?: string[];
  };

  constructor(data: NPCData) {
    this.id = data.id;
    this.name = data.name;
    this.type = data.type;
    this.x = data.x;
    this.y = data.y;
    this.sprite = data.sprite;
    this.dialogs = new Map();
    this.info = data.info;

    // ダイアログをMapに変換
    data.dialogs.forEach((dialog) => {
      this.dialogs.set(dialog.id, dialog);
    });

    this.currentDialogId = data.initialDialogId;
  }

  getCurrentDialog(): Dialog | undefined {
    return this.dialogs.get(this.currentDialogId);
  }

  setDialogId(dialogId: string): void {
    if (this.dialogs.has(dialogId)) {
      this.currentDialogId = dialogId;
    }
  }

  resetDialog(): void {
    this.currentDialogId = this.dialogs.keys().next().value || '';
  }

  // プレイヤーとの距離を計算
  getDistanceToPlayer(playerX: number, playerY: number): number {
    const dx = this.x - playerX;
    const dy = this.y - playerY;
    return Math.sqrt(dx * dx + dy * dy);
  }
}

// 石碑（調査可能オブジェクト）
export interface MonumentData {
  id: string;
  x: number;
  y: number;
  title: string;
  text: string;
  sprite?: string;
}

export class Monument {
  id: string;
  x: number;
  y: number;
  title: string;
  text: string;
  sprite?: string;
  investigated: boolean = false;

  constructor(data: MonumentData) {
    this.id = data.id;
    this.x = data.x;
    this.y = data.y;
    this.title = data.title;
    this.text = data.text;
    this.sprite = data.sprite;
  }

  investigate(): { title: string; text: string } {
    this.investigated = true;
    return {
      title: this.title,
      text: this.text,
    };
  }

  getDistanceToPlayer(playerX: number, playerY: number): number {
    const dx = this.x - playerX;
    const dy = this.y - playerY;
    return Math.sqrt(dx * dx + dy * dy);
  }
}
