class ApplicationController < ActionController::Base
  protect_from_forgery
  helper_method :current_customer
  
  private
  def current_customer
    @current_customer ||= Customer.find(session[:customer_id]) if session[:customer_id]
  end

end
