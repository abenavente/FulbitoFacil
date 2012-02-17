class CreateUbications < ActiveRecord::Migration
  def change
    create_table :ubications do |t|
      t.string :name

      t.timestamps
    end
  end
end
