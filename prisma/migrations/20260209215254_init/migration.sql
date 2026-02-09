-- CreateTable
CREATE TABLE "accounts" (
    "account_id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "date_of_birth" TIMESTAMP(3) NOT NULL,
    "sex" TEXT NOT NULL DEFAULT 'Not Selected',
    "country_id" INTEGER NOT NULL,
    "visibility_id" INTEGER NOT NULL DEFAULT 1,
    "dark_mode" BOOLEAN NOT NULL DEFAULT false,
    "jwt_token" TEXT,
    "token_version" INTEGER NOT NULL DEFAULT 0,
    "state" TEXT NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("account_id")
);

-- CreateTable
CREATE TABLE "countries" (
    "country_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "countries_pkey" PRIMARY KEY ("country_id")
);

-- CreateTable
CREATE TABLE "categories" (
    "category_id" SERIAL NOT NULL,
    "category_name" TEXT NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("category_id")
);

-- CreateTable
CREATE TABLE "subcategories" (
    "subcategory_id" SERIAL NOT NULL,
    "subcategory_name" TEXT NOT NULL,
    "category_id" INTEGER NOT NULL,
    "popular" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "subcategories_pkey" PRIMARY KEY ("subcategory_id")
);

-- CreateTable
CREATE TABLE "lists_meta" (
    "list_id" SERIAL NOT NULL,
    "account_id" INTEGER NOT NULL,
    "category_id" INTEGER NOT NULL,
    "subcategory_id" INTEGER NOT NULL,
    "visibility_id" INTEGER NOT NULL DEFAULT 1,
    "state" BOOLEAN NOT NULL DEFAULT true,
    "creation_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "mod_date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lists_meta_pkey" PRIMARY KEY ("list_id")
);

-- CreateTable
CREATE TABLE "items" (
    "item_id" SERIAL NOT NULL,
    "item_name" TEXT NOT NULL,

    CONSTRAINT "items_pkey" PRIMARY KEY ("item_id")
);

-- CreateTable
CREATE TABLE "lists" (
    "id" SERIAL NOT NULL,
    "list_id" INTEGER NOT NULL,
    "item_id" INTEGER NOT NULL,
    "list_rank" INTEGER NOT NULL,

    CONSTRAINT "lists_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "accounts_email_key" ON "accounts"("email");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_username_key" ON "accounts"("username");

-- CreateIndex
CREATE UNIQUE INDEX "countries_name_key" ON "countries"("name");

-- CreateIndex
CREATE UNIQUE INDEX "lists_meta_account_id_category_id_subcategory_id_key" ON "lists_meta"("account_id", "category_id", "subcategory_id");

-- CreateIndex
CREATE UNIQUE INDEX "items_item_name_key" ON "items"("item_name");

-- CreateIndex
CREATE UNIQUE INDEX "lists_list_id_list_rank_key" ON "lists"("list_id", "list_rank");

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_country_id_fkey" FOREIGN KEY ("country_id") REFERENCES "countries"("country_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subcategories" ADD CONSTRAINT "subcategories_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("category_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lists_meta" ADD CONSTRAINT "lists_meta_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("account_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lists_meta" ADD CONSTRAINT "lists_meta_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("category_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lists_meta" ADD CONSTRAINT "lists_meta_subcategory_id_fkey" FOREIGN KEY ("subcategory_id") REFERENCES "subcategories"("subcategory_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lists" ADD CONSTRAINT "lists_list_id_fkey" FOREIGN KEY ("list_id") REFERENCES "lists_meta"("list_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lists" ADD CONSTRAINT "lists_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "items"("item_id") ON DELETE RESTRICT ON UPDATE CASCADE;
