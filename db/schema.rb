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

ActiveRecord::Schema.define(:version => 20120217192334) do

  create_table "additional_services", :force => true do |t|
    t.integer  "service_type_id"
    t.string   "description"
    t.decimal  "tarifa"
    t.datetime "created_at",      :null => false
    t.datetime "updated_at",      :null => false
  end

  add_index "additional_services", ["service_type_id"], :name => "index_additional_services_on_service_type_id"

  create_table "canchas", :force => true do |t|
    t.string   "name"
    t.integer  "local_id"
    t.text     "caracteristicas"
    t.datetime "created_at",      :null => false
    t.datetime "updated_at",      :null => false
  end

  add_index "canchas", ["local_id"], :name => "index_canchas_on_local_id"

  create_table "canchita", :force => true do |t|
    t.string   "name"
    t.integer  "local_id"
    t.text     "caracteristicas"
    t.string   "foto_file_name"
    t.string   "foto_content_type"
    t.integer  "foto_file_size"
    t.datetime "foto_updated_at"
    t.datetime "created_at",        :null => false
    t.datetime "updated_at",        :null => false
  end

  add_index "canchita", ["local_id"], :name => "index_canchita_on_local_id"

  create_table "comments", :force => true do |t|
    t.integer  "rating"
    t.string   "comment"
    t.integer  "customers_id"
    t.integer  "sportsfields_id"
    t.datetime "created_at",      :null => false
    t.datetime "updated_at",      :null => false
  end

  add_index "comments", ["customers_id"], :name => "index_comments_on_customers_id"
  add_index "comments", ["sportsfields_id"], :name => "index_comments_on_sportsfields_id"

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
    t.string   "encrypted_password"
  end

  add_index "customers", ["district_id"], :name => "index_customers_on_district_id"
  add_index "customers", ["genere_id"], :name => "index_customers_on_genere_id"
  add_index "customers", ["identity_card_type_id"], :name => "index_customers_on_identity_card_type_id"

  create_table "dia_semanas", :force => true do |t|
    t.string   "name"
    t.datetime "created_at", :null => false
    t.datetime "updated_at", :null => false
  end

  create_table "districts", :force => true do |t|
    t.string   "name"
    t.datetime "created_at", :null => false
    t.datetime "updated_at", :null => false
  end

  create_table "generes", :force => true do |t|
    t.string   "name"
    t.datetime "created_at", :null => false
    t.datetime "updated_at", :null => false
  end

  create_table "horario_atencions", :force => true do |t|
    t.integer  "cancha_id"
    t.integer  "dia_semana_id"
    t.time     "start_time"
    t.time     "end_time"
    t.datetime "created_at",    :null => false
    t.datetime "updated_at",    :null => false
  end

  add_index "horario_atencions", ["cancha_id"], :name => "index_horario_atencions_on_cancha_id"
  add_index "horario_atencions", ["dia_semana_id"], :name => "index_horario_atencions_on_dia_semana_id"

  create_table "identity_card_types", :force => true do |t|
    t.string   "name"
    t.datetime "created_at", :null => false
    t.datetime "updated_at", :null => false
  end

  create_table "locals", :force => true do |t|
    t.string   "name"
    t.string   "address"
    t.integer  "district_id"
    t.string   "phone"
    t.datetime "created_at",  :null => false
    t.datetime "updated_at",  :null => false
    t.integer  "owner_id"
    t.float    "latitude"
    t.float    "longitude"
    t.boolean  "gmaps"
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
    t.string   "encrypted_password"
  end

  add_index "owners", ["genere_id"], :name => "index_owners_on_genere_id"
  add_index "owners", ["identity_card_type_id"], :name => "index_owners_on_identity_card_type_id"

  create_table "publicities", :force => true do |t|
    t.string   "titulo"
    t.string   "contenido"
    t.date     "fechaInicio"
    t.date     "fechaFin"
    t.decimal  "tarifa"
    t.integer  "nroclick"
    t.integer  "ubications_id"
    t.datetime "created_at",    :null => false
    t.datetime "updated_at",    :null => false
  end

  add_index "publicities", ["ubications_id"], :name => "index_publicities_on_ubications_id"

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

  create_table "tarifas", :force => true do |t|
    t.integer  "cancha_id"
    t.boolean  "promocion"
    t.integer  "dia_semana_id"
    t.time     "start_time"
    t.time     "end_time"
    t.integer  "price"
    t.datetime "created_at",    :null => false
    t.datetime "updated_at",    :null => false
  end

  add_index "tarifas", ["cancha_id"], :name => "index_tarifas_on_cancha_id"
  add_index "tarifas", ["dia_semana_id"], :name => "index_tarifas_on_dia_semana_id"

  create_table "ubications", :force => true do |t|
    t.string   "name"
    t.datetime "created_at", :null => false
    t.datetime "updated_at", :null => false
  end

  create_table "usercustomers", :force => true do |t|
    t.string   "email",                  :default => "", :null => false
    t.string   "encrypted_password",     :default => "", :null => false
    t.string   "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.integer  "sign_in_count",          :default => 0
    t.datetime "current_sign_in_at"
    t.datetime "last_sign_in_at"
    t.string   "current_sign_in_ip"
    t.string   "last_sign_in_ip"
    t.datetime "created_at",                             :null => false
    t.datetime "updated_at",                             :null => false
  end

  add_index "usercustomers", ["email"], :name => "index_usercustomers_on_email", :unique => true
  add_index "usercustomers", ["reset_password_token"], :name => "index_usercustomers_on_reset_password_token", :unique => true

end
