class CreateComments < ActiveRecord::Migration
  def change
    create_table :comments do |t|
      t.integer :rating
      t.string :comment
      t.string :customers_id
      t.string :references
      t.string :customers

      t.timestamps
    end
  end
end
