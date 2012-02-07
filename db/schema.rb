# encoding: UTF-8
# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended to check this file into your version control system.

ActiveRecord::Schema.define(:version => 20120207152602) do

  create_table "customers", :force => true do |t|
    t.string   "name"
    t.string   "lastname"
    t.integer  "genere_id"
    t.integer  "identity_card_type_id"
    t.string   "number_identity_card"
    t.string   "address"
    t.integer  "distrito_id"
    t.string   "email"
    t.string   "password"
    t.date     "birthday"
    t.string   "phone"
    t.datetime "created_at",            :null => false
    t.datetime "updated_at",            :null => false
  end

  add_index "customers", ["distrito_id"], :name => "index_customers_on_distrito_id"
  add_index "customers", ["genere_id"], :name => "index_customers_on_genere_id"
  add_index "customers", ["identity_card_type_id"], :name => "index_customers_on_identity_card_type_id"

  create_table "distritos", :force => true do |t|
    t.string   "name"
    t.datetime "created_at", :null => false
    t.datetime "updated_at", :null => false
  end

  create_table "generes", :force => true do |t|
    t.string   "name"
    t.datetime "created_at", :null => false
    t.datetime "updated_at", :null => false
  end

  create_table "identity_card_types", :force => true do |t|
    t.string   "name"
    t.datetime "created_at", :null => false
    t.datetime "updated_at", :null => false
  end

end
