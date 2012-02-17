
FulbitoFacil::Application.routes.draw do    
  resources :tarifas

  resources :horario_atencions

  resources :dia_semanas

  resources :canchas

  resources :canchita

  devise_for :usercustomers, :customers ,:owners 
  

  devise_scope :customer do
      match "inicioSesionJugador" => "devise/sessions#new"
      
     
  end
  devise_scope :owner do
      match "inicioSesionOwner" => "devise/sessions#new"
  
  end

  resources :additional_services

  resources :service_types

  resources :rates

  resources :sportsfields

#  get "log_in" => "session#create", :as => "log_in"
# get "log_out" => "sessions#destroy", :as => "log_out"
  #match "log_in" => "session#create" #, :as => "log_in"
  #match "log_out" => "session#destroy"
  match "registro" => "vistasGenerales#registro"
  match "registroDueno" => "owners#new"
  match "registroJugador" => "customers#new"
  match "buscarCanchas" => "sportsfields#index"
  match "reservaActual" => "customers#new"
  match "panelJugador/:id" => "customers#show", :as =>'panelJugador'
  match "panelOwner/:id" => "owners#show", :as =>'panelOwner'
  match "localesOwner/:id" => "locals#index", :as =>'localesOwner'
  match "panel" => "vistasGenerales#panel"
  match "reservas" => "customers#new"
  match "canchitasLocal/:id" => "canchas#index", :as =>'canchitasLocal'
  match "tarifasCanchita/:id" => "tarifas#index", :as =>'tarifasCanchita'
  match "horarioCanchita/:id" => "horarioAtencions#index", :as =>'horarioCanchita'
  
  #match "inicioSesion" => "devise/sessions#new"

  get "sign_up" => "customers#new", :as => "sign_up"


  root :to => "vistasGenerales#index"


  

  resources :customers

  resources :locals

  resources :districts

  resources :owners


  resources :identity_card_types

  resources :generes

  resources :identity_card_types

  resources :id_types



  # The priority is based upon order of creation:
  # first created -> highest priority.

  # Sample of regular route:
  #   match 'products/:id' => 'catalog#view'
  # Keep in mind you can assign values other than :controller and :action

  # Sample of named route:
  #   match 'products/:id/purchase' => 'catalog#purchase', :as => :purchase
  # This route can be invoked with purchase_url(:id => product.id)

  # Sample resource route (maps HTTP verbs to controller actions automatically):
  #   resources :products

  # Sample resource route with options:
  #   resources :products do
  #     member do
  #       get 'short'
  #       post 'toggle'
  #     end
  #
  #     collection do
  #       get 'sold'
  #     end
  #   end

  # Sample resource route with sub-resources:
  #   resources :products do
  #     resources :comments, :sales
  #     resource :seller
  #   end

  # Sample resource route with more complex sub-resources
  #   resources :products do
  #     resources :comments
  #     resources :sales do
  #       get 'recent', :on => :collection
  #     end
  #   end

  # Sample resource route within a namespace:
  #   namespace :admin do
  #     # Directs /admin/products/* to Admin::ProductsController
  #     # (app/controllers/admin/products_controller.rb)
  #     resources :products
  #   end

  # You can have the root of your site routed with "root"
  # just remember to delete public/index.html.
  # root :to => 'welcome#index'

  # See how all your routes lay out with "rake routes"

  # This is a legacy wild controller route that's not recommended for RESTful applications.
  # Note: This route will make all actions in every controller accessible via GET requests.
  # match ':controller(/:action(/:id))(.:format)'
end
