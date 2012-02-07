class CreateDistritos < ActiveRecord::Migration
  def change
    create_table :distritos do |t|
      t.string :name

      t.timestamps
    end
  end
end
