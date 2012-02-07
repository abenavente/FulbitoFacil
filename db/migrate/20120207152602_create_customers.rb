class CreateCustomers < ActiveRecord::Migration
  def change
    create_table :customers do |t|
      t.string :name
      t.string :lastname
      t.references :genere
      t.references :identity_card_type
      t.string :number_identity_card
      t.string :address
      t.references :distrito
      t.string :email
      t.string :password
      t.date :birthday
      t.string :phone

      t.timestamps
    end
    add_index :customers, :genere_id
    add_index :customers, :identity_card_type_id
    add_index :customers, :distrito_id
  end
end
