class CreateComments < ActiveRecord::Migration
  def change
    create_table :comments do |t|
      t.integer :rating
      t.string :comment
      t.references :customers
      t.references :sportsfields

      t.timestamps
    end
    add_index :comments, :customers_id
    add_index :comments, :sportsfields_id
  end
end
