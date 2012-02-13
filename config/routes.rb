<<<<<<< HEAD
FulbitoFacil::Application.routes.draw do 
  
  
#  get "log_in" => "session#create", :as => "log_in"
 # get "log_out" => "sessions#destroy", :as => "log_out"
  match "log_in" => "session#create" #, :as => "log_in"
  match "log_out" => "session#destroy"

  get "sign_up" => "customers#new", :as => "sign_up"
  root :to => "session#new"


  resources :sessions

  resources :customers

  resources :distritos
=======
FulbitoFacil::Application.routes.draw do
  resources :locals

  resources :districts

  resources :owners
>>>>>>> ValidacionesCreacionRegistroDueno

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
