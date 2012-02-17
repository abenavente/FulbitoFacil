class CreateDiaSemanas < ActiveRecord::Migration
  def change
    create_table :dia_semanas do |t|
      t.string :name

      t.timestamps
    end
  end
end
