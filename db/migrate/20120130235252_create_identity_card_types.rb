class CreateIdentityCardTypes < ActiveRecord::Migration
  def change
    create_table :identity_card_types do |t|
      t.string :name

      t.timestamps
    end
  end
end
