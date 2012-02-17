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

ActiveRecord::Schema.define(:version => 20120217051547) do

  create_table "additional_services", :force => true do |t|
    t.integer  "service_type_id"
    t.string   "description"
    t.decimal  "tarifa"
    t.datetime "created_at",      :null => false
    t.datetime "updated_at",      :null => false
  end

  add_index "additional_services", ["service_type_id"], :name => "index_additional_services_on_service_type_id"

  create_table "customers", :force => true do |t|
    t.string   "name"
    t.string   "lastname"
    t.integer  "genere_id"
    t.integer  "identity_card_type_id"
    t.string   "number_identity_card"
    t.string   "address"
    t.integer  "district_id"
    t.string   "email"
    t.string   "password"
    t.date     "birthday"
    t.string   "phone"
    t.datetime "created_at",            :null => false
    t.datetime "updated_at",            :null => false
    t.string   "password_confirmation"
    t.string   "email_confirmation"
  end

  add_index "customers", ["district_id"], :name => "index_customers_on_district_id"
  add_index "customers", ["genere_id"], :name => "index_customers_on_genere_id"
  add_index "customers", ["identity_card_type_id"], :name => "index_customers_on_identity_card_type_id"

  create_table "districts", :force => true do |t|
    t.string   "name"
    t.datetime "created_at", :null => false
    t.datetime "updated_at", :null => false
  end

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

  create_table "locals", :force => true do |t|
    t.string   "name"
    t.string   "address"
    t.integer  "district_id"
    t.text     "google_maps_address"
    t.string   "phone"
    t.datetime "created_at",          :null => false
    t.datetime "updated_at",          :null => false
    t.integer  "owner_id"
  end

  add_index "locals", ["district_id"], :name => "index_locals_on_district_id"
  add_index "locals", ["owner_id"], :name => "index_locals_on_owner_id"

  create_table "owners", :force => true do |t|
    t.string   "name"
    t.string   "lastname"
    t.integer  "genere_id"
    t.integer  "identity_card_type_id"
    t.string   "number_identity_card"
    t.string   "email"
    t.string   "password"
    t.date     "birthday",              :limit => 255
    t.datetime "created_at",                           :null => false
    t.datetime "updated_at",                           :null => false
    t.string   "password_confirmation"
    t.string   "email_confirmation"
  end

  add_index "owners", ["genere_id"], :name => "index_owners_on_genere_id"
  add_index "owners", ["identity_card_type_id"], :name => "index_owners_on_identity_card_type_id"

  create_table "rates", :force => true do |t|
    t.time     "start_time"
    t.time     "end_time"
    t.integer  "price"
    t.boolean  "promocio"
    t.date     "start_date"
    t.date     "end_date"
    t.boolean  "monday"
    t.boolean  "tuesday"
    t.boolean  "wednesday"
    t.boolean  "thursday"
    t.boolean  "friday"
    t.boolean  "saturday"
    t.boolean  "sunday"
    t.datetime "created_at", :null => false
    t.datetime "updated_at", :null => false
  end

  create_table "service_types", :force => true do |t|
    t.string   "name"
    t.datetime "created_at", :null => false
    t.datetime "updated_at", :null => false
  end

  create_table "sportsfields", :force => true do |t|
    t.string   "name"
    t.text     "feature"
    t.boolean  "monday"
    t.boolean  "tuesday"
    t.boolean  "wednesday"
    t.boolean  "thursday"
    t.boolean  "friday"
    t.boolean  "saturday"
    t.boolean  "sunday"
    t.time     "mon_start_time"
    t.time     "mon_end_time"
    t.time     "tue_start_time"
    t.time     "tue_end_time"
    t.time     "wed_start_time"
    t.time     "wed_end_time"
    t.time     "thu_start_time"
    t.time     "thu_end_time"
    t.time     "fri_start_time"
    t.time     "fri_end_time"
    t.time     "sat_start_time"
    t.time     "sat_end_time"
    t.time     "sun_start_time"
    t.time     "sun_end_start"
    t.string   "imagen"
    t.datetime "created_at",          :null => false
    t.datetime "updated_at",          :null => false
    t.string   "imagen_file_name"
    t.string   "imagen_content_type"
    t.integer  "imagen_file_size"
    t.datetime "imagen_updated_at"
    t.integer  "local_id"
  end

  add_index "sportsfields", ["local_id"], :name => "index_sportsfields_on_local_id"

end
