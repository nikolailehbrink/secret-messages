CREATE TABLE `Message` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`createdAt` integer NOT NULL,
	`encryptedContent` text NOT NULL,
	`iv` text NOT NULL,
	`uuid` text NOT NULL,
	`isOneTimeMessage` integer DEFAULT false NOT NULL,
	`expiresAt` integer,
	`isDecrypted` integer DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `Message_iv_unique` ON `Message` (`iv`);--> statement-breakpoint
CREATE UNIQUE INDEX `Message_uuid_unique` ON `Message` (`uuid`);--> statement-breakpoint
CREATE TABLE `MessageCounter` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`count` integer DEFAULT 0 NOT NULL,
	`type` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `MessageCounter_type_unique` ON `MessageCounter` (`type`);