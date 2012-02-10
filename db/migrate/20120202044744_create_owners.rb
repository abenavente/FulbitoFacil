class CreateOwners < ActiveRecord::Migration
  def change
    create_table :owners do |t|
      t.string :name
      t.string :lastname
      t.references :genere
      t.references :identity_card_type
      t.string :number_identity_card
      t.string :email
      t.string :password
      t.string :birthday

      t.timestamps
    end
    add_index :owners, :genere_id
    add_index :owners, :identity_card_type_id
  end
end
