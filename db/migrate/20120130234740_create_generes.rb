class CreateGeneres < ActiveRecord::Migration
  def change
    create_table :generes do |t|
      t.string :name

      t.timestamps
    end
  end
end
