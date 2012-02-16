require 'test_helper'

class AdditionalServicesControllerTest < ActionController::TestCase
  setup do
    @additional_service = additional_services(:one)
  end

  test "should get index" do
    get :index
    assert_response :success
    assert_not_nil assigns(:additional_services)
  end

  test "should get new" do
    get :new
    assert_response :success
  end

  test "should create additional_service" do
    assert_difference('AdditionalService.count') do
      post :create, additional_service: @additional_service.attributes
    end

    assert_redirected_to additional_service_path(assigns(:additional_service))
  end

  test "should show additional_service" do
    get :show, id: @additional_service
    assert_response :success
  end

  test "should get edit" do
    get :edit, id: @additional_service
    assert_response :success
  end

  test "should update additional_service" do
    put :update, id: @additional_service, additional_service: @additional_service.attributes
    assert_redirected_to additional_service_path(assigns(:additional_service))
  end

  test "should destroy additional_service" do
    assert_difference('AdditionalService.count', -1) do
      delete :destroy, id: @additional_service
    end

    assert_redirected_to additional_services_path
  end
end
