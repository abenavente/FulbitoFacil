class CreateAdditionalServices < ActiveRecord::Migration
  def change
    create_table :additional_services do |t|
      t.references :service_type
      t.string :description
      t.decimal :tarifa

      t.timestamps
    end
    add_index :additional_services, :service_type_id
  end
end
